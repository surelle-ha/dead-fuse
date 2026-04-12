<template>
  <Teleport to="body">
    <div v-if="bubble.visible" ref="wrapRef" class="bubble-wrap" :style="wrapStyle">

      <!-- ── FAB (collapsed) ──────────────────────────────────────── -->
      <template v-if="!bubble.open">
        <button
          class="bubble-fab"
          :class="bubble.activated ? 'bubble-fab--active' : ''"
          title="SDK Tester"
          @click="bubble.open = true"
          @mousedown.prevent="startDrag"
          @touchstart.prevent="startDragTouch"
        >
          <FlaskConical class="w-4 h-4" />
          <span v-if="bubble.sdkState" class="bubble-dot" :class="dotClass(bubble.sdkState)" />
        </button>
      </template>

      <!-- ── Panel (expanded) ─────────────────────────────────────── -->
      <template v-else>
        <div class="bubble-panel" :style="panelStyle">

          <!-- Header — draggable -->
          <div
            class="bubble-panel-header"
            @mousedown.prevent="startDrag"
            @touchstart.prevent="startDragTouch"
          >
            <div class="flex items-center gap-2 min-w-0">
              <FlaskConical class="w-3.5 h-3.5 text-fuse-dim flex-shrink-0" />
              <span class="text-xs font-semibold text-fuse-text">SDK Tester</span>
              <span v-if="bubble.instanceName" class="text-[9px] font-mono text-fuse-muted bg-white/[0.04] border border-white/[0.07] px-1.5 py-0.5 rounded truncate max-w-[90px]">
                {{ bubble.instanceName }}
              </span>
            </div>
            <div class="flex items-center gap-0.5 flex-shrink-0">
              <button @click.stop="bubble.open = false" class="hdr-btn" title="Minimise">
                <Minus class="w-3 h-3" />
              </button>
              <button @click.stop="hide()" class="hdr-btn hdr-btn--close" title="Close">
                <X class="w-3 h-3" />
              </button>
            </div>
          </div>

          <!-- Config -->
          <div class="p-3 space-y-2 border-b border-white/[0.06]">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="b-label">Project ID</label>
                <input v-model="cfg.projectId" type="text" class="b-input font-mono" placeholder="project-key" :disabled="tester.activated" />
              </div>
              <div>
                <label class="b-label">Token</label>
                <input v-model="cfg.token" type="text" class="b-input font-mono" placeholder="instance-token" :disabled="tester.activated" />
              </div>
            </div>
            <div class="flex gap-2">
              <button @click="activate" :disabled="tester.activated || !cfg.projectId || !cfg.token" class="b-btn-activate flex-1">
                <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="tester.activated ? 'bg-fuse-green animate-pulse' : 'bg-white/25'" />
                {{ tester.activated ? 'Active' : 'Activate' }}
              </button>
              <button @click="deactivate" :disabled="!tester.activated" class="b-btn-ghost px-3">Stop</button>
            </div>
          </div>

          <!-- State -->
          <div class="px-3.5 py-2.5 flex items-center gap-4 border-b border-white/[0.06]">
            <div>
              <p class="b-label mb-0.5">State</p>
              <p class="text-sm font-bold font-mono" :class="stateColor(tester.state)">{{ tester.state ?? '—' }}</p>
            </div>
            <div class="flex-1 min-w-0">
              <p class="b-label mb-0.5">Last message</p>
              <p class="text-[10px] text-fuse-dim truncate">{{ tester.lastMessage || '—' }}</p>
            </div>
          </div>

          <!-- Log -->
          <div class="p-2.5">
            <div class="flex items-center justify-between mb-1.5">
              <span class="b-label mb-0">Events ({{ tester.logs.length }})</span>
              <button @click="tester.logs = []" class="text-[9px] font-mono text-fuse-muted hover:text-fuse-dim transition-colors">Clear</button>
            </div>
            <div class="b-log" ref="logRef">
              <p v-if="!tester.logs.length" class="text-center text-[10px] text-fuse-muted font-mono py-4">No events yet</p>
              <div v-for="(e,i) in tester.logs" :key="i" class="b-log-row">
                <span class="text-[9px] font-mono text-fuse-muted w-14 flex-shrink-0">{{ e.time }}</span>
                <span class="text-[9px] font-mono font-bold w-16 flex-shrink-0 uppercase" :class="logColor(e.type)">{{ e.type }}</span>
                <span class="text-[10px] text-fuse-dim truncate">{{ e.msg }}</span>
              </div>
            </div>
          </div>

          <!-- Footer link -->
          <div class="px-3 pb-3">
            <NuxtLink
              :to="`/sdk-tester?projectId=${cfg.projectId}&token=${cfg.token}&name=${encodeURIComponent(bubble.instanceName || '')}`"
              class="block text-center text-[10px] font-mono text-fuse-muted hover:text-fuse-dim border border-white/[0.07] hover:border-white/[0.12] rounded-lg py-1.5 transition-all"
            >
              Open full tester →
            </NuxtLink>
          </div>
        </div>
      </template>

    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { FlaskConical, Minus, X } from 'lucide-vue-next'
import DeadFuse from '@surelle-ha/dead-fuse'

const { bubble, hide } = useSdkTester()

// ── Position ──────────────────────────────────────────────────────
// We track distance from the BOTTOM-RIGHT corner of the viewport.
// This way the bubble stays put when toggling open/closed regardless
// of the panel height, and we never go off-screen.
const PANEL_W  = 320
const PANEL_H  = 480   // approximate max height of expanded panel
const FAB_SIZE = 44
const MARGIN   = 24

const edgeRight  = ref(MARGIN)   // px from right edge
const edgeBottom = ref(MARGIN)   // px from bottom edge

const wrapRef = ref<HTMLElement | null>(null)
const logRef  = ref<HTMLElement | null>(null)

// The wrapper sits at a fixed position derived from bottom/right
const wrapStyle = computed(() => ({
  position:   'fixed'      as const,
  right:      `${edgeRight.value}px`,
  bottom:     `${edgeBottom.value}px`,
  zIndex:     9999,
  userSelect: 'none'       as const,
}))

// The panel opens UP and to the LEFT from the FAB anchor.
// We use absolute positioning relative to the wrapper so it stays
// connected to the bubble regardless of where it was dragged.
const panelStyle = computed(() => {
  // Clamp so the panel never exceeds the viewport top
  const maxH = Math.min(PANEL_H, window.innerHeight - edgeBottom.value - FAB_SIZE - 8)
  return {
    position:     'absolute'  as const,
    bottom:       `${FAB_SIZE + 8}px`,   // 8px gap above FAB
    right:        '0px',
    width:        `${PANEL_W}px`,
    maxHeight:    `${maxH}px`,
    overflowY:    'auto'      as const,
  }
})

// ── Drag ──────────────────────────────────────────────────────────
// We move the bubble by adjusting bottom/right offsets.
// On mousedown we record the initial viewport position of the pointer
// plus the current offsets, then compute new offsets on mousemove.

let dragStartClientX = 0
let dragStartClientY = 0
let dragStartRight   = 0
let dragStartBottom  = 0

function startDrag(e: MouseEvent) {
  dragStartClientX = e.clientX
  dragStartClientY = e.clientY
  dragStartRight   = edgeRight.value
  dragStartBottom  = edgeBottom.value

  const onMove = (me: MouseEvent) => {
    const dx = me.clientX - dragStartClientX
    const dy = me.clientY - dragStartClientY
    // Moving right → decrease edgeRight; moving down → decrease edgeBottom
    const newRight  = Math.max(0, Math.min(window.innerWidth  - FAB_SIZE, dragStartRight  - dx))
    const newBottom = Math.max(0, Math.min(window.innerHeight - FAB_SIZE, dragStartBottom + dy))
    edgeRight.value  = newRight
    edgeBottom.value = newBottom
  }
  const onUp = () => {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup',   onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup',   onUp)
}

function startDragTouch(e: TouchEvent) {
  const t0 = e.touches[0]
  dragStartClientX = t0.clientX
  dragStartClientY = t0.clientY
  dragStartRight   = edgeRight.value
  dragStartBottom  = edgeBottom.value

  const onMove = (te: TouchEvent) => {
    const t = te.touches[0]
    const dx = t.clientX - dragStartClientX
    const dy = t.clientY - dragStartClientY
    edgeRight.value  = Math.max(0, Math.min(window.innerWidth  - FAB_SIZE, dragStartRight  - dx))
    edgeBottom.value = Math.max(0, Math.min(window.innerHeight - FAB_SIZE, dragStartBottom + dy))
  }
  const onEnd = () => {
    window.removeEventListener('touchmove', onMove)
    window.removeEventListener('touchend',  onEnd)
  }
  window.addEventListener('touchmove', onMove, { passive: true })
  window.addEventListener('touchend',  onEnd)
}

// ── Config synced from bubble state ──────────────────────────────
const cfg = reactive({ projectId: '', token: '' })
watch(() => bubble.value.projectId, v => { cfg.projectId = v }, { immediate: true })
watch(() => bubble.value.token,     v => { cfg.token     = v }, { immediate: true })

// ── Tester ───────────────────────────────────────────────────────
const tester = reactive<{
  activated: boolean
  state: string | null
  lastMessage: string
  logs: { time: string; type: string; msg: string }[]
}>({ activated: false, state: null, lastMessage: '', logs: [] })

function addLog(type: string, msg: string) {
  const time = new Date().toLocaleTimeString('en-GB', { hour12: false })
  tester.logs.push({ time, type, msg })
  nextTick(() => { if (logRef.value) logRef.value.scrollTop = logRef.value.scrollHeight })
}

function setState(s: string) {
  tester.state          = s
  bubble.value.sdkState = s
}

function activate() {
  if (!cfg.projectId || !cfg.token) return
  try {
    DeadFuse.activate({
      projectId:    cfg.projectId,
      token:        cfg.token,
      fallbackMode: 'readonly',
      onActive:       () => { setState('ACTIVE');        addLog('active',   'Full access granted.') },
      onWarning:  (m) => { setState('WARNING');  tester.lastMessage = m; addLog('warning', `Warning: ${m}`) },
      onReadonly:     () => { setState('READONLY');      addLog('readonly', 'Writes blocked.') },
      onLimited:      () => { setState('LIMITED');       addLog('limited',  'Limited mode.') },
      onLocked:   (m) => { setState('LOCKED');   tester.lastMessage = m; addLog('locked',  `Locked: ${m}`) },
      onExpired:      () => { setState('EXPIRED');       addLog('expired',  'Expired.') },
      onSleep:        () => { setState('SLEEP');         addLog('sleep',    'App paused.') },
      onSelfDestruct: () => { setState('SELF_DESTRUCT'); addLog('destruct', 'Self-destruct.') },
      onDisconnect:   () => {                            addLog('disconn',  'Lost connection.') },
      onReconnect:    () => {                            addLog('reconn',   'Reconnected.') },
    })
    tester.activated       = true
    bubble.value.activated = true
    addLog('info', `Activated — project "${cfg.projectId}"`)
  } catch (err: any) {
    addLog('error', err?.message ?? 'Activation failed')
  }
}

function deactivate() {
  DeadFuse.deactivate()
  tester.activated       = false
  tester.state           = null
  tester.lastMessage     = ''
  bubble.value.activated = false
  bubble.value.sdkState  = null
  addLog('info', 'Deactivated.')
}

onUnmounted(() => { if (tester.activated) DeadFuse.deactivate() })

// ── Style helpers ─────────────────────────────────────────────────
function dotClass(s: string) {
  const m: Record<string,string> = { ACTIVE:'bg-fuse-green', WARNING:'bg-fuse-yellow', READONLY:'bg-fuse-blue', LIMITED:'bg-fuse-orange', LOCKED:'bg-fuse-red', EXPIRED:'bg-fuse-red', SLEEP:'bg-fuse-muted', SELF_DESTRUCT:'bg-fuse-purple' }
  return m[s] ?? 'bg-fuse-muted'
}
function stateColor(s: string | null) {
  if (!s) return 'text-fuse-muted'
  const m: Record<string,string> = { ACTIVE:'text-fuse-green', WARNING:'text-fuse-yellow', READONLY:'text-fuse-blue', LIMITED:'text-fuse-orange', LOCKED:'text-fuse-red', EXPIRED:'text-fuse-red', SLEEP:'text-fuse-dim', SELF_DESTRUCT:'text-fuse-purple' }
  return m[s] ?? 'text-fuse-text'
}
function logColor(type: string) {
  const m: Record<string,string> = { active:'text-fuse-green', warning:'text-fuse-yellow', readonly:'text-fuse-blue', limited:'text-fuse-orange', locked:'text-fuse-red', expired:'text-fuse-red', sleep:'text-fuse-dim', destruct:'text-fuse-purple', disconn:'text-fuse-muted', reconn:'text-fuse-blue', error:'text-fuse-red', info:'text-fuse-muted' }
  return m[type] ?? 'text-fuse-muted'
}
</script>

<style scoped>
.bubble-wrap { display: inline-block; }

/* FAB */
.bubble-fab {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(18,18,18,0.95);
  backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ababab;
  cursor: grab;
  transition: border-color 0.15s, color 0.15s, box-shadow 0.15s;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
}
.bubble-fab:hover  { border-color: rgba(255,255,255,0.22); color: #f0f0f0; box-shadow: 0 6px 28px rgba(0,0,0,0.6); }
.bubble-fab:active { cursor: grabbing; }
.bubble-fab--active { border-color: rgba(0,255,136,0.4); color: #00ff88; }

.bubble-dot {
  position: absolute;
  top: 3px; right: 3px;
  width: 8px; height: 8px;
  border-radius: 50%;
  border: 1.5px solid #0a0a0a;
}

/* Panel */
.bubble-panel {
  border-radius: 14px;
  border: 0.5px solid rgba(255,255,255,0.1);
  background: rgba(12,12,12,0.98);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 24px 72px rgba(0,0,0,0.75), 0 0 0 0.5px rgba(255,255,255,0.04);
  overflow: hidden;
}

.bubble-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  cursor: grab;
  user-select: none;
}
.bubble-panel-header:active { cursor: grabbing; }

.hdr-btn {
  width: 22px; height: 22px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 6px;
  color: #6b6b6b;
  transition: color 0.1s, background 0.1s;
  border: none; background: none; cursor: pointer;
}
.hdr-btn:hover { color: #ababab; background: rgba(255,255,255,0.05); }
.hdr-btn--close:hover { color: #ff3333; }

/* Form elements */
.b-label {
  display: block;
  font-size: 9px;
  font-family: 'Space Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #6b6b6b;
  margin-bottom: 4px;
}
.b-input {
  width: 100%; font-size: 10px; padding: 5px 8px;
  border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);
  background: rgba(0,0,0,0.35); color: #f0f0f0; outline: none;
  transition: border-color 0.15s;
}
.b-input:focus    { border-color: rgba(255,51,51,0.4); }
.b-input:disabled { opacity: 0.4; cursor: not-allowed; }

.b-btn-activate {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 6px 10px; border-radius: 7px;
  border: 1px solid rgba(0,255,136,0.25); background: rgba(0,255,136,0.09);
  color: #00ff88; font-size: 11px; font-weight: 600; cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.b-btn-activate:not(:disabled):hover { background: rgba(0,255,136,0.16); border-color: rgba(0,255,136,0.4); }
.b-btn-activate:disabled { opacity: 0.4; cursor: not-allowed; }

.b-btn-ghost {
  display: flex; align-items: center; justify-content: center;
  padding: 6px 10px; border-radius: 7px;
  border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03);
  color: #ababab; font-size: 11px; cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.b-btn-ghost:not(:disabled):hover { border-color: rgba(255,255,255,0.16); color: #f0f0f0; }
.b-btn-ghost:disabled { opacity: 0.35; cursor: not-allowed; }

/* Log */
.b-log {
  height: 130px; overflow-y: auto;
  border-radius: 7px; border: 1px solid rgba(255,255,255,0.05);
  background: rgba(0,0,0,0.3); padding: 5px;
}
.b-log-row {
  display: flex; align-items: flex-start; gap: 6px;
  padding: 2px 0; border-bottom: 1px solid rgba(255,255,255,0.03);
}
.b-log-row:last-child { border-bottom: none; }
</style>